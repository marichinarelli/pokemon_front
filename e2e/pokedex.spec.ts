import { expect, test } from '@playwright/test'

test('sem sessão redireciona para o login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
})

test('adiciona com foto, vê na lista, abre e exclui', async ({ page }) => {
  const nickname = `E2E ${Date.now()}`

  await page.goto('/login')
  await page.getByLabel('Email').fill(process.env.E2E_EMAIL!)
  await page.getByLabel('Senha').fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('heading', { name: 'Minha Pokédex' })).toBeVisible()

  await page.getByRole('link', { name: 'Adicionar pokémon' }).click()
  await page.getByLabel('Nome ou número').fill('bulbasaur')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page.getByRole('heading', { name: 'bulbasaur' })).toBeVisible()
  await page.getByLabel('Apelido').fill(nickname)
  await page.getByLabel('Foto (opcional)').setInputFiles('e2e/fixtures/foto.png')
  await page.getByRole('button', { name: 'Salvar na Pokédex' }).click()

  await expect(page.getByRole('heading', { name: nickname })).toBeVisible()
  await page.getByRole('heading', { name: nickname }).click()
  await expect(page).toHaveURL(/\/pokemon\//)
  await expect(page.getByRole('img', { name: nickname })).toHaveAttribute('src', /pokemon-photos/)

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Excluir' }).click()
  await expect(page.getByRole('heading', { name: 'Minha Pokédex' })).toBeVisible()
  await expect(page.getByRole('heading', { name: nickname })).toHaveCount(0)
})
