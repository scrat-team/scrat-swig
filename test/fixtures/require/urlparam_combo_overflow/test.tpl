<!DOCTYPE html>
{% html %}
    {% head %}
        <meta charset="utf-8"/>
        {% title %}test{% endtitle %}
    {% endhead %}
    {% body %}
        {% require $id="views/multiple/main/chick" %}
        {% require $id="views/multiple/main/goose/goose.js" %}
        {% require $id="views/multiple/second/run" %}

        {% require $id="bar" %}
        {% require $id="foo" title="foo" __href=href deep=deep.foo  %}
    {% endbody %}
{% endhtml %}