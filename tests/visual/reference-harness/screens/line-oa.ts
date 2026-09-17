import type { ScreenDefinition } from "./admin";

export const LINE_OA_SCREENS: ScreenDefinition[] = [
  {
    name: "line-chat",
    url: "http://localhost:3000/chat",
    description: "LINE OA chat interface",
    artifactId: "5a25b866-28",
    states: ["default", "loading", "error"],
    fixtureMapping: "farmer-user",
  },
  {
    name: "line-upload",
    url: "http://localhost:3000/upload",
    description: "Photo upload interface",
    artifactId: "5a25b866-28",
    states: ["default", "uploading", "success", "error"],
    fixtureMapping: "farmer-with-plot",
  },
  {
    name: "line-summary",
    url: "http://localhost:3000/summary",
    description: "Upload summary and confirmation",
    artifactId: "5a25b866-28",
    states: ["default", "confirmed"],
    fixtureMapping: "farmer-with-upload",
  },
];
