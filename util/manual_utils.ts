/* Copyright 2020 the Deno authors. All rights reserved. MIT license. */

const oldXBasepath = "https://deno.land/x/deno@";
const xBasepath = "https://deno.land/x/manual@";
const githubBasepath = "https://raw.githubusercontent.com/denoland/manual/";
const oldDocpath = "https://github.com/denoland/deno/blob/";
const docpath = "https://github.com/denoland/manual/blob/";
import VERSIONS from "../versions.json";
import compareVersions from "tiny-version-compare";

export const versions = VERSIONS.cli;

export interface TableOfContents {
  [slug: string]: {
    name: string;
    children?: {
      [slug: string]: string;
    };
  };
}

// Returns true if the version is of the 0.x release line, or betwen 1.0.0 and
// 1.12.0 inclusive. During this time the manual was part of the main repo. It
// is now a seperate repo.
function isOldVersion(version: string) {
  return compareVersions(version, "v1.12.0") !== 1;
}

function basepath(version: string) {
  if (isPreviewVersion(version)) {
    return githubBasepath + version;
  }
  if (isOldVersion(version)) {
    return oldXBasepath + version + "/docs";
  }
  return xBasepath + version;
}

export async function getTableOfContents(
  version: string,
): Promise<TableOfContents> {
  const res = await fetch(`${basepath(version)}/toc.json`);
  if (res.status !== 200) {
    throw Error(
      `Got an error (${res.status}) while getting the manual table of contents:\n${await res
        .text()}`,
    );
  }
  return await res.json();
}

export async function getTableOfContentsMap(
  version: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const tableOfContents = await getTableOfContents(version);

  Object.entries(tableOfContents).forEach(([slug, entry]) => {
    if (entry.children) {
      Object.entries(entry.children).forEach(([childSlug, name]) => {
        map.set(`/${slug}/${childSlug}`, name);
      });
    }
    map.set(`/${slug}`, entry.name);
  });

  return map;
}

export function getFileURL(version: string, path: string): string {
  return `${basepath(version)}${path}.md`;
}

export function getDocURL(version: string, path: string): string {
  if (isOldVersion(version)) {
    return `${oldDocpath}${version}/docs${path}.md`;
  }

  return `${docpath}${version}${path}.md`;
}

export function isPreviewVersion(version: string): boolean {
  return VERSIONS.cli.find((v) => v === version) === undefined;
}
