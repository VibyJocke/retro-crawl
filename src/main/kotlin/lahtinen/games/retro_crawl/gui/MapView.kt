package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.util.SimplePoint
import java.awt.Color
import java.awt.Graphics
import java.awt.image.BufferedImage
import java.util.*
import javax.swing.JPanel
import kotlin.math.min

class MapView : JPanel(), Observer {
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
                squareSize - 10,
                squareSize - 15,
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
        drawFog(g, updatedFogOfWarMatrix)
    }

    private fun updatePlayerTraversedMatrix() {
        playerTraversedMatrix[playerPosition!!.x][playerPosition!!.y] = true
    }

    private val updatedFogOfWarMatrix: Array<BooleanArray>
        get() {
            val fogOfWarMatrix = initiateBooleanMatrix(levelImage)
            var x = 0
            for (row in playerTraversedMatrix) {
                var y = 0
                for (rowPixel in row) {
                    if (rowPixel) {
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
                    y++
                }
                x++
            }
            return fogOfWarMatrix
        }

    private fun drawFog(g: Graphics, fogOfWarMatrix: Array<BooleanArray>) {
        var x = 0
        for (row in fogOfWarMatrix) {
            var y = 0
            for (rowPixel in row) {
                if (!rowPixel) {
                    g.color = Color.BLACK
                    g.drawRect(x, y, 0, 0)
                }
                y++
            }
            x++
        }
    }

    private fun deepCopy(bi: BufferedImage): BufferedImage {
        val cm = bi.colorModel
        return BufferedImage(
            cm,
            bi.copyData(null),
            cm.isAlphaPremultiplied,
            null
        )
    }

    private val squareSize: Int
        get() = min(width, height)

    override fun update(o: Observable, mapUpdateData: Any) {
        when (mapUpdateData) {
            is BufferedImage -> {
                levelImage = mapUpdateData
                playerTraversedMatrix = initiateBooleanMatrix(levelImage)
            }
            is SimplePoint -> playerPosition = mapUpdateData
            else -> throw IllegalArgumentException("Update of unknown type!")
        }
        this.repaint()
    }

    private fun initiateBooleanMatrix(levelImage: BufferedImage?): Array<BooleanArray> {
        val matrix = Array(
            levelImage!!.height
        ) { BooleanArray(levelImage.width) }
        for (row in matrix) {
            Arrays.fill(row, false)
        }
        return matrix
    }
}
