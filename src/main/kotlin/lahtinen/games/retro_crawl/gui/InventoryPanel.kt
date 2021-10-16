package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.Inventory
import java.awt.BorderLayout
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.border.EmptyBorder

class InventoryPanel(inventory: Inventory) : JPanel(BorderLayout()) {

    init {
        border = EmptyBorder(10, 10, 10, 10)
        val title = JLabel("Inventory")
        title.font = GuiConstants.TITLE_FONT
        add(title, BorderLayout.NORTH)
        isVisible = true
    }
}