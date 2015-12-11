Meteor.methods({
    addWebsite: function(newWebsite) {
        if(!Meteor.userId()) {
            throw new Meteor.Error( 500, 'Please log in before adding a website');
        }
        var metaData = extractMeta(newWebsite.url);
        if(metaData.title) {
            newWebsite.title = metaData.title
        }
        if(metaData.description) {
            newWebsite.description = metaData.description
        }
        if(metaData.image) {
            newWebsite.image = metaData.image
        }
        newWebsite.createdOn = new Date();
        newWebsite.createdBy = Meteor.userId();
        newWebsite.upvoteCount = 1;
        newWebsite.upvoters = [Meteor.userId()];
        newWebsite.downvoters = [];
        newWebsite.comments = [];
        Websites.insert(newWebsite)
        return newWebsite;
    },
    addComment: function(website, comment) {
        if(!Meteor.userId()) {
            throw new Meteor.Error( 500, 'Please log in before commenting');
        }
        comment.createdOn = new Date();
        comment.createdBy = Meteor.userId();
        if(website && comment) {
            Websites.update({_id: website }, { 
                $addToSet: { 
                    comments : comment 
                }
            });
        }
        return comment;
    },
    upvoteWebsite: function(website) {
        if(!Meteor.userId()) {
            throw new Meteor.Error( 500, 'Please log in before upvoting');
        }
        //Check if user has already upvoted the website
        for(i = 0; i < website.upvoters.length; i++) {
            if(website.upvoters[i] == Meteor.userId()) {
                return false;
            }
        }
        //Check if user has already downvoted the website
        for(i = 0; i < website.downvoters.length; i++) {
            if(website.downvoters[i] == Meteor.userId()) {
                Websites.update(website._id, {
                    $addToSet: {upvoters: Meteor.userId()}, 
                    $pull: {downvoters : Meteor.userId()},
                    $inc: {upvoteCount: 1, downvoteCount: -1}
                });
                return website
            }
        }
        //do initial upvote on website;
        Websites.update(website._id, {
            $addToSet: {upvoters: Meteor.userId()},
            $inc: {upvoteCount: 1}}
        );
        return website;
    },
    downvoteWebsite: function(website) {
        if(!Meteor.userId()) {
            throw new Meteor.Error( 500, 'Please log in before downvoting');
        }
        //Check if user has already downvoted the website
        for(i = 0; i < website.downvoters.length; i++) {
            if(website.downvoters[i] == Meteor.userId()) {
                return false;
            }
        }
        //Check if user has already upvoted the website
        for(i = 0; i < website.upvoters.length; i++) {
            if(website.upvoters[i] == Meteor.userId()) {
                Websites.update(website._id, {
                    $addToSet: {downvoters: Meteor.userId()}, 
                    $pull: {upvoters : Meteor.userId()},
                    $inc: {downvoteCount: 1, upvoteCount: -1}
                });
                return website;
            }
        }
        //Do initial downvote on website
        Websites.update(website._id, {
            $addToSet: {downvoters: Meteor.userId()}, 
            $inc: {downvoteCount: 1}}
        );
        return website;
    }
});

Websites.allow({
    'insert': function(userId, doc) { 
        if(Meteor.user()) {
            if(userId != doc.createdBy) {
                return false;
            }
            else {
                return true;
            }
        }
        return false;
    },
    'update': function(userId, doc) { 
        if(Meteor.user()) {
            return true; 
        }
        return false;
    },
    'remove': function() { return false}
})

Meteor.publish('websites', function() {
    return Websites.find();
});	