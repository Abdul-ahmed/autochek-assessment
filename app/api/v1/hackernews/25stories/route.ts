import { NextResponse } from "next/server";

export const GET = async (request: Request, response: Response) => {
    try {
        const response = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty');
        if (response.ok) {
            const data = await response.json();
            const fetchItemData = async (itemId: BigInteger) => {
                const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${itemId}.json?print=pretty`);
                if (itemResponse.ok) {
                    return itemResponse.json();
                } else {
                    console.error(`Failed to fetch data for item ${itemId}:`, itemResponse.statusText);
                    return null;
                }
            };

            const itemPromises = data.slice(0, 25).map((itemId: BigInteger) => fetchItemData(itemId));
            const itemData = await Promise.all(itemPromises);

            const allTitles = itemData.map((item) => item.title).join(' ');
            const words = allTitles.toLowerCase().match(/\b\w+\b/g);
            if (words) {
                const wordCounts: { [key: string]: number } = {};
                words.forEach((word) => {
                    if (wordCounts[word]) {
                        wordCounts[word] += 1;
                    } else {
                        wordCounts[word] = 1;
                    }
                });

                const wordCountArray = Object.keys(wordCounts).map((word) => ({
                    word,
                    count: wordCounts[word],
                }));
    
                wordCountArray.sort((a, b) => b.count - a.count);
                const top10Words = wordCountArray.slice(0, 10);
    
                return NextResponse.json({
                    status: true,
                    code: 200,
                    message: "Top 10 most occurring words in the titles of the last 25 stories",
                    data: top10Words
                }, {
                    status: 200
                });
            }
        } else {
            console.error('Failed to fetch data:', response.statusText);
            return NextResponse.json({
                status: false,
                code: 400,
                message: "Something went wrong.",
                data: null
            }, {
                status: 400,
            });
        }
    } catch (error) {
        console.error('Error while fetching data:', error);
        return NextResponse.json({
            status: false,
            code: 500,
            message: "Error while fetching data",
            data: null
        }, {
            status: 500,
        });
    }
}
