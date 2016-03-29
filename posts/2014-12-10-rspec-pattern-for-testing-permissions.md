---
layout: post
title: rspec pattern for testing permissions
---

### A problem you're bound to face

Most projects will run into the problem of testing multiple levels of
permissions with rspec at some point. The project I was on came up with what I
take to be the most sane way of tackling permission testing with rspec.

For example, say you're trying to test success and failure of 3 different
authorization settings. You might try this to accomplish permission testing on
each controller action:

``` ruby
before do
  permissions
end

context "as a super admin" do
  let(:permissions) { stub_an_admin }

  it "allows them to do this action" do
    ...
  end
end

context "as a plebian user" do
  let(:permissions) { stub_some_permissions }

  it "disallows this action" do
    ...
  end
end

```

### A more centralized solution

Setting the permissions in each context for a higher level before block is both
confusing and spreads permission logic out over every controller spec. What we
want is to have a central location where permission logic for specs can be
accessed. This of course assumes you have a permission system with a relatively
complex hierarchy of needs (If you don't now, you probably will in the future).

Ideally we would want to test controller actions like this:

``` ruby
as_admin_on :some_resource do
  it "allows this action" do
    ...
  end
end
```

This shows clearly what permission level we expect right out front and doesn't
require defining permission stubbing logic in each context. Luckily we can do
this by using a controller macro to write new contexts for given permissions.

To centralize permission stubbing we use `support/controller_macros.rb` to
contain all the contexts. (don't forget to add the module to your
`rails_helper.rb`)

``` ruby
module ControllerMacros
  module ClassMethods
    def as_admin_on(resource_type, &block)
      context "as an Admin" do
        before do
          stub_permissions_for(send(resource_type))
          try(:request!)
        end

        class_exec(&block)
      end
    end

    def as_plebian_user(&block)
      context "with no permissions" do
        before do
          stub_basic_user
          try(:request!)
        end

        class_exec(&block)
      end
    end
  end
end
```

This to me makes it very explicit what permission spec is being tested for each
case and if stubbing methods change, you have one central location to change.

Shoutout to [chris arcand](http://chrisarcand.com) for this solution to
organizing permissions testing.
