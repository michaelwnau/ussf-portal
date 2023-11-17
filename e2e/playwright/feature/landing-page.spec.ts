import { test as base } from '@playwright/test'
import path from 'path'
import { faker } from '@faker-js/faker'
import {
  fixtures,
  TestingLibraryFixtures,
} from '@playwright-testing-library/test/fixture'
import { adminUser } from '../cms/database/users'
import { LoginPage } from '../models/Login'

type CustomFixtures = {
  loginPage: LoginPage
}

const test = base.extend<TestingLibraryFixtures & CustomFixtures>({
  ...fixtures,
  loginPage: async ({ page, context }, use) => {
    await use(new LoginPage(page, context))
  },
})

const { expect } = test

const tagTitle = faker.lorem.words()
const articleTitle = faker.lorem.words()
const articleSlug = faker.helpers.slugify(articleTitle)
const articlePreview = faker.lorem.words()
const articleBody = faker.lorem.words()
const landingPageTitle = faker.lorem.words()
const landingPageSlug = faker.helpers.slugify(landingPageTitle)
const landingPageDescription = faker.lorem.words()
const documentSectionTitle = faker.lorem.words()
const documentTitle = faker.lorem.words()

const testfile = path.resolve(__dirname, 'test-file.pdf')

test('can create a landing page in the CMS and view it in the portal', async ({
  page,
  loginPage,
}) => {
  await loginPage.login(adminUser.username, adminUser.password)

  await expect(page.locator('text=WELCOME, FLOYD KING')).toBeVisible()

  await page.goto('http://localhost:3001/')

  await expect(
    page.locator('text=FLOYD.KING.376144527@testusers.cce.af.mil')
  ).toBeVisible()

  // Create Article
  await page.getByRole('link', { name: 'Create Article' }).click()
  await page.locator('.css-ackcql').first().click()
  await page.getByText('LandingPage', { exact: true }).click()
  await page.getByLabel('Slug').click()
  await page.getByLabel('Slug').fill(articleSlug)
  await page.getByLabel('Title').click()
  await page.getByLabel('Title').fill(articleTitle)
  await page.getByLabel('Preview').click()
  await page.getByLabel('Preview').fill(articlePreview)
  await page.getByRole('textbox', { name: 'Body' }).click()
  await page.getByRole('textbox', { name: 'Body' }).fill(articleBody)
  await page.getByRole('button', { name: 'Create related Tag' }).click()
  await page.getByLabel('Name').click()
  await page.getByLabel('Name').fill(tagTitle)
  await page.getByRole('button', { name: 'Create Tag' }).click()
  await page.getByRole('button', { name: 'Create Article' }).click()
  await page.getByText('Published', { exact: true }).click()
  await page.getByRole('button', { name: 'Save changes' }).click()

  // Create Landing Page
  await page.getByRole('link', { name: 'Landing Page' }).click()
  await page.waitForSelector('text=Create Landing Page')
  await page.getByRole('link', { name: 'Create Landing Page' }).click()
  await page.getByLabel('Page Title').click()
  await page.getByLabel('Page Title').fill(landingPageTitle)
  await page.getByLabel('Slug').click()
  await page.getByLabel('Slug').fill(landingPageSlug)
  await page.getByLabel('Page Description').click()
  await page.getByLabel('Page Description').fill(landingPageDescription)

  // Add document section inline
  await page
    .getByRole('button', { name: 'Create related Document Section' })
    .click()
  await page.getByLabel('Title', { exact: true }).fill(documentSectionTitle)
  await page
    .getByRole('button', { name: 'Create related Document', exact: true })
    .click()
  await page.getByRole('button', { name: 'Upload File' }).click()

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('text=Upload').click(),
  ])
  await fileChooser.setFiles(testfile)

  await page
    .getByRole('dialog', { name: 'Create Document', exact: true })
    .locator('#title')
    .click()
  await page
    .getByRole('dialog', { name: 'Create Document', exact: true })
    .locator('#title')
    .fill(documentTitle)
  await page
    .getByRole('button', { name: 'Create Document', exact: true })
    .click()
  await page.getByRole('button', { name: 'Create Document Section' }).click()

  // Add collections
  await page.getByRole('group', { name: 'Collections' }).locator('svg').click()
  await page.getByText('Career', { exact: true }).click()
  await page
    .getByRole('group', { name: 'Collections' })
    .locator('svg')
    .nth(2)
    .click()
  await page.getByText('Medical & Dental', { exact: true }).click()

  // Add tag
  await page.getByRole('group', { name: 'Article Tag' }).locator('svg').click()
  await page.getByText(tagTitle, { exact: true }).click()

  // Save Landing Page
  await page.getByRole('button', { name: 'Create Landing Page' }).click()

  // Navigate to the portal
  await page.goto('http://localhost:3000/')
  await page.getByRole('link', { name: 'Landing Pages' }).click()
  await expect(
    page.getByRole('heading', { name: 'Landing Pages' })
  ).toBeVisible()

  // Navigate to the landing page
  await page.getByRole('link', { name: landingPageTitle }).click()

  // These headings are only visible when there is content in the section, so
  // if they are visible, we know the content is there
  await expect(
    page.getByRole('heading', { name: 'Documentation' })
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Collections' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Articles' })).toBeVisible()

  // Navigate to an article that is linked to the landing page and
  // check that the tag is correct
  const page1Promise = page.waitForEvent('popup')
  await page.getByRole('link', { name: articleTitle }).click()
  const page1 = await page1Promise
  await expect(page1.getByRole('link', { name: tagTitle })).toBeVisible()

  expect(page1.url()).toBe(
    `http://localhost:3000/landing/${landingPageSlug}/${articleSlug}`
  )
})