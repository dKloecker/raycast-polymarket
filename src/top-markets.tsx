import { List, ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";
import fetch from "node-fetch";
import { useState, useEffect } from "react";
import { Ticker } from "./types";
import { formatPercentage, getFirstOutcomePrice, trimQuestion, formatVolumeWithSuffix, getMarketUrl } from "./utils";

function MarketList({ ticker }: { ticker: Ticker }) {
  const sortedMarkets = [...ticker.markets].sort((a, b) => {
    const aPrice = getFirstOutcomePrice(a.outcomePrices);
    const bPrice = getFirstOutcomePrice(b.outcomePrices);
    return bPrice - aPrice;
  });

  return (
    <List>
      {sortedMarkets.map((market) => {
        try {
          if (!market.outcomePrices || (!market.groupItemTitle && !market.question)) {
            return null;
          }

          const firstPrice = getFirstOutcomePrice(market.outcomePrices);
          const volume = Number(market.volume24hr) || 0;

          return (
            <List.Item
              key={market.question}
              title={market.groupItemTitle || trimQuestion(market.question)}
              accessories={[
                { text: formatPercentage(firstPrice) },
                { text: `24h Vol: ${formatVolumeWithSuffix(volume)}` },
              ]}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser title="Open Market" url={getMarketUrl(ticker.slug)} />
                  <Action.CopyToClipboard
                    title="Copy Market Info"
                    content={`${market.groupItemTitle || market.question}\n${formatPercentage(firstPrice)}\n24h Volume: ${formatVolumeWithSuffix(volume)}`}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                </ActionPanel>
              }
            />
          );
        } catch {
          return null;
        }
      })}
    </List>
  );
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [tickers, setTickers] = useState<Ticker[]>([]);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await fetch(
          "https://gamma-api.polymarket.com/events?limit=50&active=true&archived=false&closed=false&order=volume24hr&ascending=false&offset=0",
        );

        if (!response.ok) {
          throw new Error("Failed to fetch markets");
        }

        const data = (await response.json()) as Ticker[];
        setTickers(data.sort((a, b) => b.volume24hr - a.volume24hr));
      } catch (error) {
        setTickers([]);
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch markets",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTickers();
  }, []);

  return (
    <List isLoading={isLoading}>
      {tickers.map((ticker) => (
        <List.Item
          key={ticker.title}
          title={ticker.title}
          subtitle={`${ticker.markets.length} markets`}
          accessories={[{ text: `24h Vol: ${formatVolumeWithSuffix(ticker.volume24hr)}` }]}
          actions={
            <ActionPanel>
              <Action.Push title="View Markets" target={<MarketList ticker={ticker} />} icon={Icon.AppWindowList} />
              <Action.CopyToClipboard
                title="Copy Market Info"
                content={`${ticker.title}\n24h Volume: ${formatVolumeWithSuffix(ticker.volume24hr)}\nMarkets: ${ticker.markets.length}`}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
