package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.util.SimplePoint
import java.awt.Color
import java.awt.Graphics
import java.awt.image.BufferedImage
import java.util.*
import java.util.logging.Logger
import javax.swing.JPanel
import kotlin.math.min

class MapView : JPanel(), Observer {
    private val log: Logger = Logger.getLogger(javaClass.name)
    private var levelImage: BufferedImage? = null
    private var playerPosition: SimplePoint? = null
    private lateinit var playerTraversedMatrix: Array<BooleanArray>

    init {
        background = Color.BLACK
    }

    override fun paintComponent(g: Graphics) {
        super.paintComponent(g)
        if (levelImage != null && playerPosition != null) {
            val canvasImage = deepCopy(levelImage!!)
            val canvasGraphics = canvasImage.graphics
            drawPlayerPosition(canvasGraphics)
            drawFogOfWar(canvasGraphics)
            g.drawImage(
                canvasImage,
                5,
                10,
                min(width, height) - 10,
                min(width, height) - 15,
                null
            )
        }
    }

    private fun drawPlayerPosition(g: Graphics) {
        g.color = Color.PINK
        g.drawRect(playerPosition!!.x, playerPosition!!.y, 0, 0)
    }

    private fun drawFogOfWar(g: Graphics) {
        updatePlayerTraversedMatrix()
        drawFog(g, updatedFogOfWarMatrix())
    }

    private fun updatePlayerTraversedMatrix() {
        playerTraversedMatrix[playerPosition!!.x][playerPosition!!.y] = true
    }

    private fun drawFog(g: Graphics, fogOfWarMatrix: Array<BooleanArray>) {
        fogOfWarMatrix.forEachIndexed { x, row ->
            row.forEachIndexed { y, column ->
                if (!column) {
                    g.color = Color.BLACK
                    g.drawRect(x, y, 0, 0)
                }
            }
        }
    }

    private fun updatedFogOfWarMatrix(): Array<BooleanArray> {
        val fogOfWarMatrix = initiateBooleanMatrix(levelImage)
        playerTraversedMatrix.forEachIndexed { x, row ->
            row.forEachIndexed { y, column ->
                if (column) {
                    fogOfWarMatrix[x][y] = true
                    fogOfWarMatrix[x + 1][y + 1] = true
                    fogOfWarMatrix[x - 1][y - 1] = true
                    fogOfWarMatrix[x - 1][y + 1] = true
                    fogOfWarMatrix[x + 1][y - 1] = true
                    fogOfWarMatrix[x + 1][y] = true
                    fogOfWarMatrix[x - 1][y] = true
                    fogOfWarMatrix[x][y + 1] = true
                    fogOfWarMatrix[x][y - 1] = true
                }
            }
        }
        return fogOfWarMatrix
    }

    private fun deepCopy(bi: BufferedImage): BufferedImage {
        return BufferedImage(
            bi.colorModel,
            bi.copyData(null),
            bi.colorModel.isAlphaPremultiplied,
            null
        )
    }

    override fun update(o: Observable, mapUpdateData: Any) {
        when (mapUpdateData) {
            is BufferedImage -> {
                levelImage = mapUpdateData
                playerTraversedMatrix = initiateBooleanMatrix(levelImage)
            }
            is SimplePoint -> playerPosition = mapUpdateData
            else -> log.severe("Player reached level transition")
        }
        this.repaint()
    }

    private fun initiateBooleanMatrix(levelImage: BufferedImage?): Array<BooleanArray> {
        val matrix = Array(levelImage!!.height) { BooleanArray(levelImage.width) }
        matrix.forEach { row -> Arrays.fill(row, false) }
        return matrix
    }
}
