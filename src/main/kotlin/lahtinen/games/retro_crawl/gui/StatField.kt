package lahtinen.games.retro_crawl.gui

import java.awt.BorderLayout
import java.awt.Dimension
import java.awt.FlowLayout
import java.awt.event.ActionEvent
import javax.swing.AbstractAction
import javax.swing.JButton
import javax.swing.JLabel
import javax.swing.JPanel

class StatField(private val charDialog: CharacterDialog, text: String?) : JPanel() {
    private val label: JLabel
    private val value: JLabel

    init {
        layout = BorderLayout()
        label = JLabel(text)
        value = JLabel("0")
        val dataPanel = JPanel(FlowLayout())
        dataPanel.add(value)
        dataPanel.add(getAddButton())
        dataPanel.add(getSubtractButton())
        add(label, BorderLayout.WEST)
        add(dataPanel, BorderLayout.EAST)
    }

    fun setValue(value: Int) {
        this.value.text = value.toString()
    }

    fun getValue(): Int {
        return value.text.toInt()
    }

    private fun getAddButton(): JButton {
        val button = JButton(object : AbstractAction() {
            override fun actionPerformed(e: ActionEvent) {
                var pointsLeft = charDialog.getPointsLeft()
                if (pointsLeft != 0) {
                    var intValue = value.text.toInt()
                    intValue++
                    pointsLeft--
                    charDialog.setPointsLeft(pointsLeft)
                    value.text = intValue.toString()
                }
            }
        })
        button.text = "+"
        button.preferredSize = Dimension(40, 15)
        return button
    }

    private fun getSubtractButton(): JButton {
        val button = JButton(object : AbstractAction() {
            override fun actionPerformed(e: ActionEvent) {
                if (value.text.toInt() != 0) {
                    var pointsLeft = charDialog.getPointsLeft()
                    var intValue = value.text.toInt()
                    intValue--
                    pointsLeft++
                    charDialog.setPointsLeft(pointsLeft)
                    value.text = intValue.toString()
                }
            }
        })
        button.text = "-"
        button.preferredSize = Dimension(40, 15)
        return button
    }
}
