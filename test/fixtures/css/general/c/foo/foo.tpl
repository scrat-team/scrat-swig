<h1>{{ title }}</h1>
<a href="{{ __href }}">baidu</a>
<span>{{ deep }}</span>

{% css $id="foo/h1.red.css" %}

{% require $id="sub" __subHref=__href %}
