"use server";

import { scrapeWeb } from "@/web-scraper/scraper-actions";


export async function callWebScraper(data: FormData) {
	const url = data.get("url");
	if (typeof url === "string") {
        const content = await scrapeWeb(url);
        console.log(content);
        return content;
	} else {
        console.log("URL is not a valid string");
	}
    return null;
}
