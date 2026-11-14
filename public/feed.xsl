<?xml version="1.0" encoding="UTF-8"?>
<!--
  How secnt.org's two reader feeds (/feed.xml and /articles/feed.xml) look
  when someone opens one in a web browser (Release D, ruling 25), on the
  precedent of the lecture site's podcast/public/feed.xsl. Feed readers never
  read this: they read the feed itself. A browser that does not apply XSLT
  simply shows the raw feed, which is harmless. Colours are the Visual
  Register tokens.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"
    doctype-system="about:legacy-compat"/>

  <xsl:template match="/rss/channel">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title><xsl:value-of select="title"/> — feed</title>
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
          ol { list-style: none; padding: 0; }
          li { margin: 0 0 1.25rem; }
          a { color: #b8860b; }
          a:hover { color: #8a6608; }
          .meta { display: block; font-size: 0.9rem; color: #6b6b6b; }
          .desc { display: block; font-size: 0.98rem; }
        </style>
      </head>
      <body>
        <main>
          <a class="wordmark" href="/">SECNT</a>
          <hr/>
          <h1><xsl:value-of select="title"/></h1>
          <p><xsl:value-of select="description"/></p>
          <div class="note">
            <p><strong>This is a feed, for a feed reader to follow.</strong></p>
            <p>To follow it, copy this page's address into your feed reader.</p>
          </div>
          <ol>
            <xsl:for-each select="item">
              <li>
                <a href="{link}"><xsl:value-of select="title"/></a>
                <span class="meta"><xsl:value-of select="substring(pubDate, 6, 11)"/></span>
                <span class="desc"><xsl:value-of select="description"/></span>
              </li>
            </xsl:for-each>
          </ol>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
