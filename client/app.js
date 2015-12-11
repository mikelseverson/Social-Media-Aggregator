////
// Session Variables
////
Session.set('websiteLimit', 8);

/////
// Subscription
/////
Meteor.subscribe("websites");

////
// Routing
////
Router.configure({
    layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function() {
    this.render('navbar', {
        to:"navbar"
    });
    this.render('website_list', {
        to:"sidebar"
    });
    this.render('website_detail', {
        to:"main"
    });
});

Router.route('/:_id', function() {
    this.render('navbar', {
        to:"navbar"
    });
    this.render('website_list', {
        to:"sidebar",
        data: function() {
            return {url: true}
        }
    })
    this.render('website_detail', {
        to:"main",
        data: function() {
            return Websites.findOne(this.params._id);
        }
    });
});


/////
// Template functionality on render
/////
Template.navbar.rendered = function() {
    $(".button-collapse").sideNav();
}

Template.website_list.rendered = function () {
    lastScrollTop = 0
    $('#website-list').on( 'scroll', function(){
        if($('#website-list').scrollTop() > $('#website-list').height()) {
            var scrollTop = $('#website-list').scrollTop();
            if(scrollTop > (lastScrollTop + 50)) {
                Session.set('websiteLimit', Session.get("websiteLimit") + 2);
            }
            lastScrollTop = scrollTop
        }
    });
};

/////
// Template helpers
/////
Template.registerHelper('formatDate', function(date) {
    return moment(date).fromNow();
});

Template.registerHelper('websites', function(){
    return Websites.find({}, {sort: {upvoteCount: -1}, limit : Session.get('websiteLimit')});
});

Template.website_item.helpers({
    votes: function() {
        return this.upvoters.length - this.downvoters.length;
    },
    checkUpvoted: function() {
        for(var i = 0; i < this.upvoters.length; i++) {
            if(this.upvoters[i] == Meteor.userId()) {
                return true;
            }
        }
        return false;
    },
    checkDownvoted: function() {
        for(var i = 0; i < this.downvoters.length; i++) {
            if(this.downvoters[i] == Meteor.userId()) {
                return true;
            }
        }
        return false;
    }
})

Template.website_detail.helpers({
    votes: function() {
        return this.upvoters.length - this.downvoters.length;
    },
    checkUpvoted: function() {
        for(var i = 0; i < this.upvoters.length; i++) {
            if(this.upvoters[i] == Meteor.userId()) {
                return true;
            }
        }
        return false;
    },
    checkDownvoted: function() {
        for(var i = 0; i < this.downvoters.length; i++) {
            if(this.downvoters[i] == Meteor.userId()) {
                return true;
            }
        }
        return false;
    }
})

Template.home_card.helpers({
    loggedIn: function() {
        return Meteor.user
    }
})

/////
// template events
/////
Template.website_list.events({
    "click .js-toggle-website-form": function (event) {
        $("#website_form").toggle('slow');
    }
});

Template.website_item.events({
    "click .js-upvote": function (event) {
        var website = this;
        Meteor.call("upvoteWebsite", website, function(err) {
            if(err) {
                Materialize.toast(err, 1000)
            }
            else {
                Materialize.toast("Website has been upvoted!", 500)
            }
        });
        return false;
    },
    "click .js-downvote": function (event) {
        var website = this;
        Meteor.call("downvoteWebsite", website, function(err) {
            if(err) {
                Materialize.toast(err, 500)
            }
            else {
                Materialize.toast("Website has been downvoted!", 500)
            }
        })
        return false;
    },
    "click .js-details": function (event) {
        var website_id = this._id;
        Session.set('website', website_id);
    }
});

Template.website_form.events({
    "submit .js-save-website-form": function (event) {
        //Grabs values from form
        var title = event.target.title.value,
        description = event.target.description.value,
        url = event.target.url.value;

        //Validate URL
        if (url == "") {
            Materialize.toast("Please add a URL", 1000)
            return false;
        }

        //Send data to server
        Meteor.call("addWebsite", {
            title: title,
            description: description,
            url: url
        }, function(err, website) {
            if(err) {
                Materialize.toast(err, 1000)
            }
            else {
                Materialize.toast("Website has been added!", 1000)
            }
        });

        //Hides the add website form
        $("#website_form").toggle('slow');
        event.target.title.value = "";
        event.target.description.value = "";
        event.target.url.value = "";

        return false;
    }
});

Template.website_detail.events({
"submit .js-add-comment-form": function (event) {
    //Grabs text of comment
    var comment = event.target.comment.value;

    //Send comment to server
    Meteor.call("addComment", Session.get('website'), {
        text: comment
    }, function(err, website) {
            if(err) {
                Materialize.toast(err, 1000)
            }
            else {
                Materialize.toast("Comment added!", 1000)
            }
        })

    //Clear comment form
    comment
    return false;
    },
    "click .js-upvote": function (event) {
        var website = this;
        Meteor.call("upvoteWebsite", website, function(err) {
            if(err) {
                Materialize.toast(err, 1000)
            }
            else {
                Materialize.toast("Website has been upvoted!", 500)
            }
        });
        return false;
    },
    "click .js-downvote": function (event) {
        var website = this;
        Meteor.call("downvoteWebsite", website, function(err) {
            if(err) {
                Materialize.toast(err, 1000)
            }
            else {
                Materialize.toast("Website has been downvoted!", 500)
            }
        })
        return false;
    },
})