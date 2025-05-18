import { db } from './src/db/index'
import { meals } from './src/db/schema/meals'
const mealsData = require('./recipes_canonical.json')

async function seedDatabase() {
    try {
        console.log('Seeding database...')

        const insertedMeals = await db
            .insert(meals)
            .values(mealsData)
            .returning()

        console.log('Inserted meals:', insertedMeals.length)
        console.log('Seeding completed successfully.')
    } catch (error) {
        console.error('Error seeding database:', error)
        process.exit(1)
    } finally {
        process.exit(0)
    }
}

seedDatabase()