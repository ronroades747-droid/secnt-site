<?xml version="1.0" encoding="UTF-8"?>
<!--
  How the podcast feed looks when someone opens /feed.xml in a web browser
  (Editor's ruling, Gate 5, 13 November 2026). Podcast apps never read this:
  they read the feed itself. A browser that does not apply XSLT simply shows
  the raw feed, which is harmless.

  It follows the show page's ruling: no feed address is shown, and the line
  stops after Pocket Casts. Colours are secnt.org's Visual Register tokens.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" encoding="UTF-8" indent="yes"
    doctype-system="about:legacy-compat"/>

  <xsl:template match="/rss/channel">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title><xsl:value-of select="title"/> — podcast feed</title>
        <style>
          @font-face { font-family: 'Source Serif 4'; font-weight: 400; src: url('/fonts/source-serif-4-latin-400-normal.woff2') format('woff2'); }
          @font-face { font-family: 'Source Serif 4'; font-weight: 700; src: url('/fonts/source-serif-4-latin-700-normal.woff2') format('woff2'); }
          :root { color-scheme: light; }
          body { margin: 0; background: #faf7f2; color: #1a1a1a;
                 font: 1.125rem/1.65 'Source Serif 4', Georgia, 'Times New Roman', serif; }
          main { max-width: 72ch; margin: 0 auto; padding: 2.5rem 1rem 4rem; }
          .wordmark { font-weight: 700; letter-spacing: 0.08em; color: #1a1a1a; text-decoration: none; }
          hr { border: 0; border-top: 2px solid #b8860b; margin: 1rem 0 2rem; }
          h1 { margin: 0 0 0.75rem; line-height: 1.2; }
          .note { margin: 1.5rem 0 2.5rem; padding: 1rem 1.25rem; background: #f3eee4; border-left: 3px solid #c9a961; }
          .note p { margin: 0.25rem 0; }
          h2 { font-size: 1.1rem; margin: 2rem 0 0.5rem; }
          ol { padding-left: 1.5rem; }
          li { margin: 0.6rem 0; }
          a { color: #b8860b; }
          a:hover { color: #8a6608; }
          .meta { display: block; font-size: 0.9rem; color: #6b6b6b; }
        </style>
      </head>
      <body>
        <main>
          <a class="wordmark" href="/">SECNT</a>
          <hr/>
          <h1><xsl:value-of select="title"/></h1>
          <p><xsl:value-of select="description"/></p>
          <div class="note">
            <p><strong>This is the show's podcast feed, for podcast apps to read.</strong></p>
            <p>Search for <strong><xsl:value-of select="title"/></strong> in Apple Podcasts or Pocket Casts.</p>
          </div>
          <h2>Episodes</h2>
          <ol>
            <xsl:for-each select="item">
              <li>
                <a href="{link}"><xsl:value-of select="title"/></a>
                <xsl:if test="itunes:duration">
                  <span class="meta">
                    <xsl:value-of select="floor(itunes:duration div 60)"/> min
                  </span>
                </xsl:if>
              </li>
            </xsl:for-each>
          </ol>
          <p><a href="/">The lecture site</a></p>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
