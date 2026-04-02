package com.marketaisuite.marketai.service;

import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.data.MutableDataSet;
import org.springframework.stereotype.Service;

@Service
public class MarkdownService {

    private final Parser parser;
    private final HtmlRenderer renderer;

    public MarkdownService() {
        MutableDataSet options = new MutableDataSet();
        parser = Parser.builder(options).build();
        renderer = HtmlRenderer.builder(options).build();
    }

    public String markdownToHtml(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        String cleaned = text.replaceAll("\n{3,}", "\n\n");
        String html = renderer.render(parser.parse(cleaned));
        html = html.replaceFirst("<h1>", "<h1 class=\"ai-heading-1\">");
        html = html.replaceAll("<h1>", "<h1 class=\"ai-heading-1\">");
        html = html.replaceAll("<h2>", "<h2 class=\"ai-heading-2\">");
        html = html.replaceAll("<h3>", "<h3 class=\"ai-heading-3\">");
        html = html.replaceAll("<ul>", "<ul class=\"ai-list\">");
        html = html.replaceAll("<ol>", "<ol class=\"ai-list\">");
        html = html.replaceAll("<p>", "<p class=\"ai-paragraph\">");
        html = html.replaceAll("<strong>", "<strong class=\"ai-bold\">");
        return html;
    }
}
