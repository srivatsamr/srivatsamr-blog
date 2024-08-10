---
layout: page
permalink: /archive/
title: Posts Archive
---

<div id="archives">
  <section id="archive">
    <h3>Most Recent Posts</h3>
    
    {% if site.posts.size > 0 %}
      {% assign current_year = nil %}
      {% assign current_month = nil %}
      
      {% for post in site.posts %}
        {% assign post_year = post.date | date: '%Y' %}
        {% assign post_month = post.date | date: '%B %Y' %}
        
        {% if current_year != post_year %}
          {% if current_year %}
            </ul> <!-- Close previous year's list -->
          {% endif %}
          <h2 style="text-align:left;">{{ post_year }}</h2>
          <ul class="past">
          {% assign current_year = post_year %}
          {% assign current_month = post_month %}
        {% endif %}
        
        {% if current_month != post_month %}
          {% if current_month %}
            </ul> <!-- Close previous month's list -->
          {% endif %}
          <h3 style="text-align:left;">{{ post_month }}</h3>
          <ul class="past">
          {% assign current_month = post_month %}
        {% endif %}
        
        <li><b><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title | default: post.excerpt | strip_html }}</a></b> - {{ post.date | date: "%e %B %Y" }}</li>
        
      {% endfor %}
      </ul> <!-- Close the last list -->
    {% else %}
      <p>No posts available yet.</p>
    {% endif %}
    
    <h3>Oldest Posts</h3>
  </section>
</div>
