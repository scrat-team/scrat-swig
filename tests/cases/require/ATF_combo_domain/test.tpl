<!DOCTYPE html>
{% html cdn=domain.in %}
    {% head %}
        <meta charset="utf-8"/>
        {% title %}test{% endtitle %}
    {% endhead %}
    {% body %}
        {% require $id="bar" %}
        {% ATF %}
        {% require $id="foo" title="foo" href=href deep=deep.foo %}
    {% endbody %}
{% endhtml %}