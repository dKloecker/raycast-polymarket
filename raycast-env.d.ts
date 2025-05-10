/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `top-markets` command */
  export type TopMarkets = ExtensionPreferences & {}
  /** Preferences accessible in the `search-for-market` command */
  export type SearchForMarket = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `top-markets` command */
  export type TopMarkets = {}
  /** Arguments passed to the `search-for-market` command */
  export type SearchForMarket = {}
}

