import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
// Search engines and AI assistants are welcome on public pages. Only the admin, saved list and APIs are blocked.
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "Amazonbot", "CCBot", "cohere-ai", "Meta-ExternalAgent", "DuckAssistBot", "YouBot"];
const block = ["/admin", "/saved", "/api/"];
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: block }, { userAgent: AI_BOTS, allow: "/", disallow: block }], sitemap: `${SITE}/sitemap.xml`, host: SITE };
}
