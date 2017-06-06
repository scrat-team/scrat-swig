<!DOCTYPE html>
{% html %}
    {% head %}
        <meta charset="utf-8"/>
        {% title %}test{% endtitle %}
    {% endhead %}
    {% body %}
        {% require $id="view/multiple/main/chick" %}
        {% require $id="view/multiple/main/goose/goose.js" %}
        {% require $id="view/multiple/second/run" %}

        {% require $id="bar" %}
        {% require $id="foo" title="foo" __href=href deep=deep.foo  %}
    {% endbody %}
{% endhtml %}