package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.item.InventoryManaged
import java.awt.BorderLayout
import java.awt.Dimension
import java.awt.ScrollPane
import java.awt.Toolkit
import java.util.logging.Logger
import javax.swing.*

class MainFrame : JFrame() {
    private val log: Logger = Logger.getAnonymousLogger()
    private var inventoryComponent: JList<InventoryManaged>? = null
    private val actionLogComponent: JTextArea? = null
    var mapView: MapView? = null
        get() {
            if (field == null) {
                field = MapView()
            }
            return field
        }
        private set

    init {
        initFrame()
        initGui()
        pack()
        isVisible = true
    }

    private fun initFrame() {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName())
        } catch (e: Exception) {
            log.severe("Could not set look and feel")
        }
        defaultCloseOperation = EXIT_ON_CLOSE
        autoSetFrame(800, 600)
        extendedState = this.extendedState or MAXIMIZED_BOTH
    }

    private fun autoSetFrame(x: Int, y: Int) {
        val dim = Toolkit.getDefaultToolkit().screenSize
        preferredSize = Dimension(x, y)
        setLocation((dim.width - x) / 2, (dim.height - y) / 2)
    }

    private fun initGui() {
        contentPane.layout = BorderLayout()
        val leftGroup = JPanel(BorderLayout())
        leftGroup.add(getInventoryComponent(), BorderLayout.NORTH)
        val logScrollPane = ScrollPane()
        logScrollPane.add(ActionLogTextArea())
        logScrollPane.preferredSize = Dimension(0, 300)
        leftGroup.add(logScrollPane, BorderLayout.SOUTH)
        val rightGroup = JPanel(BorderLayout())
        rightGroup.add(mapView!!, BorderLayout.CENTER)
        val splitPane = JSplitPane()
        splitPane.leftComponent = leftGroup
        splitPane.rightComponent = rightGroup
        splitPane.resizeWeight = 0.5
        splitPane.dividerLocation = 400
        add(splitPane, BorderLayout.CENTER)
    }

    private fun getInventoryComponent(): JList<InventoryManaged> {
        if (inventoryComponent == null) {
            inventoryComponent = JList()
            inventoryComponent!!.border =
                BorderFactory.createTitledBorder(null, "Inventory")
        }
        return inventoryComponent!!
    }
}
