"use server";

import { scrapeWeb } from "@/web-scraper/scraper-actions";

export async function callWebScraper(data: FormData) {
	const url = data.get("url");
	if (typeof url === "string") {
		const content = await scrapeWeb(url);

		if (!content) {
			console.error("Front-end actions: Scrape failed.");
		}

		return content;
	} else {
		console.error("Front-end actions: URL is not a valid string");
	}
	return null;
}
