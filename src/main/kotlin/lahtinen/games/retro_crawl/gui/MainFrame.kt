package lahtinen.games.retro_crawl.gui

import java.awt.BorderLayout
import java.awt.Dimension
import java.awt.GridLayout
import java.awt.ScrollPane
import java.awt.Toolkit
import java.util.logging.Logger
import javax.swing.JFrame
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.JSplitPane
import javax.swing.JTextField
import javax.swing.UIManager

class MainFrame : JFrame() {
    private val log: Logger = Logger.getAnonymousLogger()
    private val interactionViewHolder = JPanel()
    private val mapView = MapView()

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

        val playerPanel = JPanel(GridLayout(1,3))
        playerPanel.add(JLabel("Health: 12/16"))
        playerPanel.add(JLabel("Strength: 23"))
        playerPanel.add(JLabel("Whatever: asdas"))

        val leftGroup = JPanel(BorderLayout())
        leftGroup.add(interactionViewHolder, BorderLayout.CENTER)
        leftGroup.add(playerPanel, BorderLayout.NORTH)
        val logScrollPane = ScrollPane(ScrollPane.SCROLLBARS_ALWAYS)
        logScrollPane.add(ActionLogTextArea())
        logScrollPane.preferredSize = Dimension(0, 300)
        leftGroup.add(logScrollPane, BorderLayout.SOUTH)

        val rightGroup = JPanel(BorderLayout())
        rightGroup.add(mapView, BorderLayout.CENTER)

        val splitPane = JSplitPane()
        splitPane.leftComponent = leftGroup
        splitPane.rightComponent = rightGroup
        splitPane.resizeWeight = 0.5
        splitPane.dividerLocation = 400
        add(splitPane, BorderLayout.CENTER)
    }

    // Used to switch between e.g. inventory and fight view
    fun setInteractionView(panel: JPanel) {
        interactionViewHolder.removeAll()
        interactionViewHolder.add(panel)
        repaint()
    }
}
