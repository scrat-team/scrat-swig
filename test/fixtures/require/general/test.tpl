<!DOCTYPE html>
{% html %}
    {% head %}
        <meta charset="utf-8"/>
        {% title %}test{% endtitle %}
    {% endhead %}
    {% body %}
        {% require $id="foo" title="foo" href=href deep=deep.foo %}
    {% endbody %}
{% endhtml %}