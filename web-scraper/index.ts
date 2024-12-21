export type Publications = [
    {
        title: string;
        annotation: string;
        content: Array<{
            title: string;
            content: string;
        }>;
    }
]