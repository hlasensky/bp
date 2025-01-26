"use client";

import { useEffect, useState } from "react";
import { callWebScraper } from "./front-end-actions";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Home() {
	const [publications, setPublications] = useState<
		| [
				{
					title: string;
					annotation: { name: string; value: string }[] | string | null;
					content: { title: string; content: string }[];
				}
		  ]
		| null
	>(null);

	useEffect(() => {
		console.log(publications);
	}, [publications]);

	return (
		<div>
			Hi
			<form
				action={(data) => {
          callWebScraper(data).then((content) => {
            
            if (!content) 
              toast.error("Scrape failed.");
            
						setPublications(content);
					});
				}}
			>
				<Input type="text" name="url" />
				<button type="submit">Scrape</button>
			</form>
			{publications && (
				<div>
					{publications.map((publication, i) => (
						<div key={i} className="border-2 border-black rounded p-3 m-5">
							<h2 className="text-xl font-semibold">{publication.title}</h2>
							{typeof publication.annotation === "string" ? (
								<p>{publication.annotation}</p>
							) : Array.isArray(publication.annotation) ? (
								publication.annotation.map((ann, index) => (
									<p key={index}>
										{ann.name}: {ann.value}
									</p>
								))
							) : null}
							{publication.content.map((section, y) => (
								<div key={y} className="my-2">
									<h3 className="text-lg">{section.title}</h3>
									<p>{section.content}</p>
								</div>
							))}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
