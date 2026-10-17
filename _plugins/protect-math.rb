# Keep kramdown from mangling LaTeX in posts.
#
# Kramdown does not know about single-dollar math, so `$x_i ... y_i$` has its
# underscores turned into <em> before MathJax ever sees it. It does protect
# `$$...$$` (emitting \( \) inline), so inline `$...$` is rewritten as `$$...$$`.
# A one-line `$$...$$` inside a paragraph or list item would also be demoted to
# inline math, so those lines are wrapped in a raw <div> and MathJax renders
# them as display equations.

module ProtectMath
  SKIP = /(^```.*?^```|~~~.*?~~~|`[^`\n]+`|\$\$.*?\$\$)/m.freeze
  INLINE = /(?<![\\$])\$(?=\S)((?:(?!\n[ \t]*\n)[^$])*?\S)(?<!\\)\$(?![\d$])/.freeze
  DISPLAY_LINE = /^([ \t]*)(\$\$[^$].*?\$\$)[ \t]*$/.freeze

  def self.process(text)
    text = wrap_display_lines(text)
    text.split(SKIP).each_with_index.map do |part, i|
      i.odd? ? part : part.gsub(INLINE) { inline_math(Regexp.last_match) }
    end.join
  end

  # A line that starts and ends with `$$` is parsed by kramdown as one display
  # block, so math at the start of a line gets a <span> to stay inline.
  def self.inline_math(match)
    at_line_start = match.pre_match.empty? || match.pre_match =~ /\n[ \t]*\z/
    math = "$$#{match[1]}$$"
    at_line_start ? "<span>#{math}</span>" : math
  end

  def self.wrap_display_lines(text)
    in_fence = false
    text.lines.map do |line|
      in_fence = !in_fence if line =~ /^\s*(```|~~~)/
      next line if in_fence
      line.sub(DISPLAY_LINE) { "#{Regexp.last_match(1)}<div>#{Regexp.last_match(2)}</div>" }
    end.join
  end
end

Jekyll::Hooks.register %i[posts pages documents], :pre_render do |doc|
  next unless doc.path.to_s.end_with?(".md", ".markdown")
  doc.content = ProtectMath.process(doc.content)
end
