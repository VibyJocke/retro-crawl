/**
 * TODO:
 * - Implement critical hits/dmg randomization
 * - Implement item drops
 * - Implement inventory management
 * - Start reading monsters from file, and possibly by map - map1monsters.txt e.g. maybe objects too
 * - Implement fully procedurally generated dungeons?
 */
package lahtinen.games.retro_crawl.gui

import lahtinen.games.retro_crawl.CharacterAttributes
import lahtinen.games.retro_crawl.GameState
import lahtinen.games.retro_crawl.LevelController
import lahtinen.games.retro_crawl.LevelController.Direction
import lahtinen.games.retro_crawl.Player
import lahtinen.games.retro_crawl.State
import lahtinen.games.retro_crawl.controller.ActionLogController
import lahtinen.games.retro_crawl.controller.EventController
import lahtinen.games.retro_crawl.monster.Monster
import java.awt.KeyboardFocusManager
import java.awt.event.KeyEvent
import javax.swing.JFrame

class RetroCrawlFrame : JFrame() {

    init {
        val mainFrame = MainFrame()
        val characterAttributes = CharacterAttributes.newCharacter()
        val dialog = CharacterDialog(this, characterAttributes)
        dialog.isVisible = true
        val player = Player(characterAttributes)
        val gameState = GameState(player, 1, State.MAP)
        val eventController = EventController(gameState)
        val levelController = LevelController(gameState)
        setupKeyListeners(gameState, levelController, eventController)
        printStoryLog()

        // TODO: Implement controller-driven views
        val fightPanel = FightPanel(Monster.BIRD)
        val inventoryPanel = InventoryPanel(player.inventory)
        mainFrame.setInteractionView(fightPanel)
        pack()
    }

    private val moveKeys = listOf(
        KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT, KeyEvent.VK_UP, KeyEvent.VK_DOWN, KeyEvent.VK_SPACE
    )

    private fun setupKeyListeners(
        gameState: GameState,
        levelController: LevelController,
        eventController: EventController
    ) {
        KeyboardFocusManager.getCurrentKeyboardFocusManager()
            .addKeyEventDispatcher { e ->
                if (e.id == KeyEvent.KEY_PRESSED && e.keyCode in moveKeys) {
                    if (gameState.state == State.MAP) {
                        val playerMoved = when (e.keyCode) {
                            KeyEvent.VK_LEFT -> levelController.move(Direction.WEST)
                            KeyEvent.VK_RIGHT -> levelController.move(Direction.EAST)
                            KeyEvent.VK_UP -> levelController.move(Direction.NORTH)
                            KeyEvent.VK_DOWN -> levelController.move(Direction.SOUTH)
                            else -> false
                        }
                        if (playerMoved) {
                            eventController.move()
                        } else {
                            ActionLogController.INSTANCE.log("You can't walk that way...")
                        }
                    } else if (gameState.state == State.FIGHT) {
                        if (e.keyCode == KeyEvent.VK_SPACE) {
                            eventController.fight()
                        } else {
                            val canMove = when (e.keyCode) {
                                KeyEvent.VK_LEFT -> levelController.canMove(Direction.WEST)
                                KeyEvent.VK_RIGHT -> levelController.canMove(Direction.EAST)
                                KeyEvent.VK_UP -> levelController.canMove(Direction.NORTH)
                                KeyEvent.VK_DOWN -> levelController.canMove(Direction.SOUTH)
                                else -> false
                            }
                            if (canMove) {
                                eventController.attemptFlee()
                            } else {
                                ActionLogController.INSTANCE.log("You can't walk that way...")
                            }
                        }
                    }
                }
                false
            }
    }

    private fun printStoryLog() {
        ActionLogController.INSTANCE.log(
            """You stand before a great mountain. At the foot of the mountain you see a cave entrance. You carefully approach the cave and enter. 
The air is heavy and damp. The darkness swallows you. You instantly regret that you entered and turn around to leave but all you see is a solid rock wall. It's too late to go back."""
        )
    }
}
