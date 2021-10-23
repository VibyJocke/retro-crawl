package lahtinen.games.retro_crawl.util

import java.util.Random

object Utils {
    val RANDOM = Random()

    fun roll(chance: Double) = chance >= RANDOM.nextDouble()
}
