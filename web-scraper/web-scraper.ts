import puppeteer from "puppeteer";
import { Publications } from ".";

export async function scrape(url: string): Promise<Publications | null> {
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: null,
	});

	try {
		const page = await browser.newPage();

		await page.goto(url, {
			waitUntil: "domcontentloaded",
		});

		// Extract links from the '.list-timeline' element
		const links = await page.evaluate(() => {
			const ul = document.querySelector(".list-timeline");
			const aTags = ul?.querySelectorAll("a");

			if (!aTags) {
				return [];
			}

			const linkArray = [];
			if (ul) {
				for (let i = 0; i < aTags.length; i++) {
					const link = aTags[i].getAttribute("href");
					if (link) {
						linkArray.push(link);
					}
				}
			}
			return linkArray;
		});

		if (links.length === 0) {
			console.error("Scraper: No links found in '.list-timeline'.");
			return null;
		}

		// Process each link using the same browser
		const data = await Promise.all(
			links.map(async (link) => {
				const page = await browser.newPage();
				try {
					await page.goto(link, {
						waitUntil: "domcontentloaded",
					});

					const data = await page.evaluate(() => {
						const title = document
							.querySelector(".b-detail__title")
							?.textContent?.trim();
						const annotation = document
							.querySelector(".b-detail__annot")
							?.textContent?.trim();

						const contentGrid = document.querySelector(".b-detail__body div");

						if (!contentGrid) {
							console.error("Scraper: No content found in '.b-detail__body div'.");
							return { title, annotation, content: [] };
						}

						// Extract structured content from children
						const contentGridArray = Array.from(contentGrid.children);
						const content: Array<{ title: string; content: string }> = [];
						for (let i = 0; i < contentGridArray.length; i += 2) {
							const subtitle = contentGridArray[i]
								?.querySelector(".b-detail__subtitle")
								?.textContent?.trim();
							const detail = contentGridArray[i + 1]
								?.querySelector(".b-detail__content")
								?.textContent?.trim();

							if (subtitle && detail) {
								content.push({ title: subtitle, content: detail });
							} else {
								console.warn(`Scraper: Missing subtitle or detail at index ${i}`);
							}
						}

						return { title, annotation, content };
					});

					return data;
				} catch (err) {
					console.error(`Scraper: Failed to process ${link}:`, err);
				} finally {
					await page.close();
				}
			})
		);
		return data.filter((d) => d !== undefined) as Publications;
	} catch (err) {
		console.error("Scraper: Error occurred during scraping:", err);
	} finally {
		await browser.close();
	}

	return null;
}
