package lahtinen.games.retro_crawl.monster

//TODO: Make another "interactive monster" class that uses this monster as a template, and return that from the monsterfactory.
enum class Monster(
    val monsterName: String,
    val description: String,
    val baseHealth: Int,
    val baseDamage: Int,
    val speed: Int,
    val xpReward: Int
) {
    BIRD(
        "Bird",
        "A nasty bird",
        2,
        1,
        7,
        10
    ),
    SNAKE(
        "Snake",
        "A fierce snake",
        2,
        2,
        4,
        20
    ),
    WOLF(
        "Wolf",
        "A big wolf",
        5,
        3,
        6,
        30
    ),
    GOBLIN(
        "Goblin",
        "A crazy goblin",
        8,
        3,
        5,
        40
    ),
    SKELETON(
        "Skeleton",
        "An evil skeleton",
        10,
        4,
        5,
        50
    ),
    DEMON(
        "Skeleton",
        "An evil skeleton",
        20,
        10,
        6,
        150
    );

    override fun toString(): String {
        return monsterName
    }
}
