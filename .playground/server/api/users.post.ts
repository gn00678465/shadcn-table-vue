import { faker } from '@faker-js/faker/locale/zh_TW'

faker.seed(123) // 設定隨機種子以確保數據一致性

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  age: number
  gender: string
}

// 生成假數據
function generateFakeData(start: number, length: number): Person[] {
  return Array.from({ length }, (_, index) => ({
    id: `${start + index + 1}`,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    age: faker.number.int({ min: 18, max: 80 }),
    gender: faker.person.gender(),
  }))
}

const data = generateFakeData(0, 100)

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { page: number, size: number }
  const start = (body.page - 1) * body.size
  // 模擬延遲
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    total: data.length,
    data: data.slice(start, start + body.size),
  }
})
