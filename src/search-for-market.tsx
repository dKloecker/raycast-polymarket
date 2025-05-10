import { ActionPanel, Action, List, Icon } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";
import { URLSearchParams } from "node:url";
import { Ticker } from "./types";
import { formatPercentage, getFirstOutcomePrice, trimQuestion, formatVolumeWithSuffix, getMarketUrl } from "./utils";

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const { data, isLoading } = useFetch(
    "https://polymarket.com/api/events/global?" +
      new URLSearchParams({ q: searchText.length === 0 ? "" : searchText, events_status: "active" }),
    {
      parseResponse: parseFetchResponse,
    },
  );

  return (
    <List isLoading={isLoading} onSearchTextChange={setSearchText} searchBarPlaceholder="Search PolyMarket..." throttle>
      <List.Section title="Results" subtitle={data?.length + ""}>
        {data?.map((ticker) => <EventListItem key={ticker.slug} ticker={ticker} />)}
      </List.Section>
    </List>
  );
}

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

function EventListItem({ ticker: Ticker }: { ticker: Ticker }) {
  return (
    <List.Item
      key={Ticker.title}
      title={Ticker.title}
      subtitle={`${Ticker.markets.length} markets`}
      accessories={[{ text: `24h Vol: ${formatVolumeWithSuffix(Ticker.volume24hr)}` }]}
      actions={
        <ActionPanel>
          <Action.Push title="View Markets" target={<MarketList ticker={Ticker} />} icon={Icon.AppWindowList} />
          <Action.CopyToClipboard
            title="Copy Market Info"
            content={`${Ticker.title}\n24h Volume: ${formatVolumeWithSuffix(Ticker.volume24hr)}\nMarkets: ${Ticker.markets.length}`}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
        </ActionPanel>
      }
    />
  );
}

async function parseFetchResponse(response: Response) {
  const json = (await response.json()) as { events?: Ticker[] } | [] | { error: string };

  if (!response.ok || "error" in json) {
    throw new Error("error" in json ? json.error : response.statusText);
  }

  return "events" in json ? json.events : [];
}
