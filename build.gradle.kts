plugins {
    kotlin("jvm") version "2.0.0"
    application
}

group = "lahtinen.games"
version = "1.0"

application {
    mainClass.set("lahtinen.games.retro_crawl.GameAppKt")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.greenrobot:eventbus-java:3.3.1")
}

tasks.test {
    useJUnitPlatform()
}
