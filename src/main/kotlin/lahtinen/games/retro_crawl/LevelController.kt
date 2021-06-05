package lahtinen.games.retro_crawl

import lahtinen.games.retro_crawl.util.SimplePoint
import java.io.File
import java.util.*
import java.util.logging.Logger
import javax.imageio.ImageIO

class LevelController(private val gameState: GameState, observer: Observer?) : Observable() {
    private val log: Logger = Logger.getLogger(javaClass.name)
    private lateinit var map: Array<Array<MapData?>>
    private var currentPosition: SimplePoint? = null
    private var finishPosition: SimplePoint? = null

    init {
        addObserver(observer)
        loadLevel()
    }

    /**
     * Loads a new level. Looks for a file called map{level}.bmp
     * The bitmap itself can have 4 colors, representing walkable space, walls,
     * start and end locations.
     */
    private fun loadLevel() {
        val fileName = "map${gameState.level}.bmp"
        try {
            val image = ImageIO.read(File(fileName))
            val mapWidth = image.width
            val mapHeight = image.height
            map = Array(mapWidth) { arrayOfNulls(mapHeight) }
            for (i in 0 until mapWidth) {
                for (j in 0 until mapHeight) {
                    val mapDataType = parseMapDataType(image.getRGB(j, i))
                    when (mapDataType) {
                        MapData.START -> currentPosition = SimplePoint(j, i)
                        MapData.FINISH -> finishPosition = SimplePoint(j, i)
                    }
                    map[i][j] = mapDataType
                }
            }
            setChanged()
            notifyObservers(image)
            setChanged()
            notifyObservers(currentPosition)
        } catch (ex: Exception) {
            log.severe("Could not open map: $fileName")
        }
    }

    private fun parseMapDataType(colorCode: Int): MapData {
        return when (colorCode) {
            PATH_CODE -> MapData.PATH
            START_CODE -> MapData.START
            FINISH_CODE -> MapData.FINISH
            else -> MapData.SOLID
        }
    }

    private fun nextLevel() {
        gameState.level += 1
        loadLevel()
    }

    fun canMove(direction: Direction): Boolean = internalMove(direction, false)

    fun move(direction: Direction): Boolean = internalMove(direction, true)

    private fun internalMove(direction: Direction, doMove: Boolean): Boolean {
        val validMove = when (direction) {
            Direction.SOUTH -> move(0, 1, doMove)
            Direction.WEST -> move(-1, 0, doMove)
            Direction.NORTH -> move(0, -1, doMove)
            Direction.EAST -> move(1, 0, doMove)
        }
        if (doMove) {
            setChanged()
            notifyObservers(currentPosition)
            checkAndTriggerMapEvent()
        }
        return validMove
    }

    private fun move(x: Int, y: Int, move: Boolean): Boolean {
        return if (map[currentPosition!!.y + y][currentPosition!!.x + x] == MapData.SOLID) {
            false
        } else {
            if (move) {
                currentPosition =
                    SimplePoint(
                        currentPosition!!.x + x,
                        currentPosition!!.y + y
                    )
            }
            true
        }
    }

    //TODO: Add support for additional map entities - traps e.g.
    private fun checkAndTriggerMapEvent() {
        if (currentPosition == finishPosition) {
            log.info("Player reached level transition")
            nextLevel()
        }
    }

    private enum class MapData {
        PATH, SOLID, START, FINISH
    }

    enum class Direction {
        SOUTH, WEST, NORTH, EAST
    }

    companion object {
        private const val PATH_CODE = -1
        private const val START_CODE = -14503604
        private const val FINISH_CODE = -1237980
    }
}
