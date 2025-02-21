"use server"

import { scrape } from "@/web-scraper/web-scraper";

export async function scrapeWeb(url: string) {
    const content = await scrape(url);

    if (content) {
        return content;
    } 
    console.error("Scraper actions: Scrape failed.");
    return null;
}