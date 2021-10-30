package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.CharacterAttributes
import java.awt.BorderLayout
import java.awt.GridBagConstraints
import java.awt.GridBagLayout
import java.awt.event.ActionEvent
import javax.swing.AbstractAction
import javax.swing.JButton
import javax.swing.JDialog
import javax.swing.JFrame
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.JTextField
import javax.swing.border.EmptyBorder

class CharacterDialog(owner: JFrame, val newCharacter: CharacterAttributes) : JDialog(owner, true) {
    private val name: JTextField = JTextField(newCharacter.name)
    private val health: StatField = StatField(this, "Vitality", newCharacter.vitality)
    private val strength: StatField = StatField(this, "Strength", newCharacter.strength)
    private val speed: StatField = StatField(this, "Agility", newCharacter.speed)
    private val pointsLeft = JLabel("0")

    init {
        setSize(300, 225)
        isResizable = false
        setLocationRelativeTo(owner)
        title = "Character creation"
        layout = BorderLayout()
        val mainPanel = JPanel(BorderLayout())
        mainPanel.border = EmptyBorder(10, 10, 10, 10)
        val title = JLabel("Character creation")
        title.font = GuiConstants.TITLE_FONT
        mainPanel.add(title, BorderLayout.NORTH)
        mainPanel.add(getFields(), BorderLayout.CENTER)
        mainPanel.add(getButtons(), BorderLayout.SOUTH)
        contentPane.add(mainPanel)
    }

    private fun getFields(): JPanel {
        val panel = JPanel(GridBagLayout())
        val c = GridBagConstraints()
        c.fill = GridBagConstraints.BOTH
        c.ipadx = 15
        val label1 = JLabel("Character name: ")
        c.gridx = 0
        c.gridy = 0
        panel.add(label1, c)
        c.weightx = 1.0
        c.gridx = 1
        c.gridy = 0
        panel.add(name, c)
        c.weightx = 1.0
        c.gridwidth = 2
        c.gridx = 0
        c.gridy = 1
        panel.add(health, c)
        c.gridx = 0
        c.gridy = 2
        panel.add(strength, c)
        c.gridx = 0
        c.gridy = 3
        panel.add(speed, c)
        c.gridx = 1
        c.gridy = 4
        panel.add(pointsLeft, c)
        return panel
    }

    private fun getButtons(): JPanel {
        val panel = JPanel(BorderLayout())
        val okButton = JButton(object : AbstractAction("Done!") {
            override fun actionPerformed(e: ActionEvent) {
                if (name.text.isNotBlank() && getPointsLeft() == 0) {
                    newCharacter.name = name.text
                    newCharacter.vitality = health.getValue()
                    newCharacter.strength = strength.getValue()
                    newCharacter.speed = speed.getValue()
                    dispose()
                }
            }
        })
        panel.add(okButton, BorderLayout.EAST)
        return panel
    }

    fun getPointsLeft(): Int {
        return pointsLeft.text.toInt()
    }

    fun setPointsLeft(points: Int) {
        pointsLeft.text = points.toString()
    }
}
