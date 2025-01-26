import puppeteer from "puppeteer";
import { Projects, Publications } from ".";

const selectors = {
	list: ".list-timeline",
	title: ".b-detail__title",
	annotation: ".b-detail__annot-item",
	annotationProjectValue: ".b-detail__annot-item strong",
	contentGrid: ".b-detail__body div",
	subtitle: ".b-detail__subtitle",
	detail: ".b-detail__content",
};

export async function scrape(
	id: string,
	category = "projects"
): Promise<Publications | Projects | null> {
	if (!id) {
		console.error("Scraper: No id provided.");
		return null;
	}

	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: null,
	});

	// Construct the URL
	const url = `https://www.fit.vut.cz/person/${id}/${category}/.cs`;

	try {
		const page = await browser.newPage();

		await page.goto(url, {
			waitUntil: "domcontentloaded",
		});

		// Extract links from the '.list-timeline' element
		interface Selectors {
			list: string;
			title: string;
			annotation: string;
			annotationProjectValue: string;
			contentGrid: string;
			subtitle: string;
			detail: string;
		}

		const links = await page.evaluate((selectors: Selectors): string[] => {
			const ul = document.querySelector(selectors.list);
			const aTags = ul?.querySelectorAll("a");

			if (!aTags) {
				return [];
			}

			const linkArray: string[] = [];
			if (ul) {
				for (let i = 0; i < aTags.length; i++) {
					const link = aTags[i].getAttribute("href");
					if (link) {
						linkArray.push(link);
					}
				}
			}
			return linkArray;
		}, selectors);

		if (links.length === 0) {
			console.error(`Scraper: No links found in ${selectors.list}.`);
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

					const data = await page.evaluate(
						({ selectors, category }: { selectors: Selectors; category: string }) => {
							const title = document
								.querySelector(selectors.title)
								?.textContent?.trim();

							let annotation: string | { name: string; value: string }[] | null =
								null;
							if (category === "projects") {
								annotation = Array.from(
									document.querySelectorAll(selectors.annotation)
								).map((el) => {
									const name = el.childNodes[0]?.textContent?.trim().replace(":", "") || "";
									const value =
										el
											.querySelector(selectors.annotationProjectValue)
											?.textContent?.trim() || "";
									return { name, value };
								});
							} else
								annotation =
									document
										.querySelector(selectors.annotation)
										?.textContent?.trim() || null;

							const contentGrid = document.querySelector(selectors.contentGrid);

							if (!contentGrid) {
								console.error(
									`Scraper: No content found in ${selectors.contentGrid}.`
								);
								return { title, annotation, content: [] };
							}

							// Extract structured content from children
							const contentGridArray = Array.from(contentGrid.children);
							const content: Array<{ title: string; content: string }> = [];
							for (let i = 0; i < contentGridArray.length; i += 2) {
								const subtitle = contentGridArray[i]
									?.querySelector(selectors.subtitle)
									?.textContent?.trim();
								const detail = contentGridArray[i + 1]
									?.querySelector(selectors.detail)
									?.textContent?.trim();

								if (subtitle && detail) {
									content.push({ title: subtitle, content: detail });
								} else {
									console.warn(
										`Scraper: Missing subtitle or detail at index ${i}`
									);
								}
							}

							return { title, annotation, content };
						},
						{ selectors, category }
					);

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
