export type Publications = [
	{
		title: string;
		annotation: string;
		content: Array<{
			title: string;
			content: string;
		}>;
	}
];

export type Projects = [
	{
		title: string;
		annotation: {name: string; value: string}[];
		content: Array<{
			title: string;
			content: string;
		}>;
	}
];
