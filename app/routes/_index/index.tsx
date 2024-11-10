import * as fs from 'node:fs'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { Button } from '~/components/button'
import { Layout } from '~/features/layout'

const filePath = 'count.txt'

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, 'utf-8').catch(() => '0'),
  )
}

const getCount = createServerFn('GET', () => {
  return readCount()
})

const updateCount = createServerFn('POST', async (addBy: number) => {
  const count = await readCount()
  await fs.promises.writeFile(filePath, `${count + addBy}`)
})

export const Route = createFileRoute('/_index/')({
  component: Home,
  loader: async () => await getCount(),
})

function Home() {
  const router = useRouter()
  const state = Route.useLoaderData()

  return (
    <Layout>
      <Button
        variant="elevated"
        onPress={() => {
          updateCount(1).then(() => {
            router.invalidate()
          })
        }}
      >
        Add 1 to {state}?
      </Button>
    </Layout>
  )
}
