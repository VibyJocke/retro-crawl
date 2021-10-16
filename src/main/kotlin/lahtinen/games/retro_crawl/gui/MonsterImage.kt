package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.monster.Monster
import java.awt.Dimension
import java.awt.Graphics
import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO
import javax.swing.JPanel


class MonsterImage(monster: Monster) : JPanel() {
    private val image = ImageIO.read(File("${monster.name}.bmp"))
    private val imageSize = 256

    init {
        preferredSize = Dimension(imageSize, imageSize)
    }

    override fun paintComponent(g: Graphics) {
        super.paintComponent(g)
        g.drawImage(resizeImage(image), 0, 0, null)
    }

    private fun resizeImage(originalImage: BufferedImage): BufferedImage {
        val resizedImage = BufferedImage(imageSize, imageSize, BufferedImage.TYPE_INT_RGB)
        val graphics2D = resizedImage.createGraphics()
        graphics2D.drawImage(originalImage, 0, 0, imageSize, imageSize, null)
        graphics2D.dispose()
        return resizedImage
    }
}