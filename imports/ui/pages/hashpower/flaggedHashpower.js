import { Template } from 'meteor/templating';
import { HashHardware } from '../../../../lib/database/HashHardware'
import { HashPower } from '../../../../lib/database/HashPower'
import { HashAlgorithm } from '../../../../lib/database/HashAlgorithm'
import { HashUnits } from '../../../../lib/database/HashUnits'
import { FlowRouter } from 'meteor/staringatlights:flow-router';

import '../../layouts/MainBody.html'
import './flaggedHashpower.template.html'

Template.flaggedHashpower.onCreated(function() {
	this.autorun(() => {
		this.subscribe('flaggedhashpower')
		this.subscribe('hashhardware')
		this.subscribe('hashalgorithm')
		this.subscribe('hashunits')
	})

	this.flags = new ReactiveVar([])
})

Template.flaggedHashpower.helpers({
	hashpower: () => HashPower.find({
		'flags.0': { // if array has more than 0 elements
 			$exists: true
 		}
	}).fetch(),
	hashDevice: function() {
		return (HashHardware.findOne({
			_id: this.device
		}) || {}).name || ''
	},
	hashAlgorithm: function() {
		return (HashAlgorithm.findOne({
			_id: this.hashAlgorithm
		}) || {}).name || ''
	},
	unit: function() {
		return (HashUnits.findOne({
			_id: this.unit
		}) || {}).name || ''
	},
	image: function() {
	    if (this.image) {
	        return `${_hashPowerUploadDirectoryPublic}${this.image}`
	    } else {
	        return '/images/noimage.png'
	    }
	},
	voted: function() {
		return !!(this.votes || []).filter(i => i.userId === Meteor.userId()).length
	},
	upvotes: function() {
		return this.upvotes || 0
	},
	downvotes: function() {
		return this.downvotes || 0
	}
})

Template.flaggedHashpower.events({
	'click .js-vote': function(event, templateInstance) {
        let type = $(event.currentTarget).data('vote')

        Meteor.call('hashPowerVote', this._id, type, (err, data) => {
            if (err && err.error === 'mod-only') {
                sAlert.error('Only moderators can vote')
            }

            if (data === 'ok') {
                sAlert.success('Flags were successfully removed.')
            } else if (data === 'not-ok') {
            	sAlert.success('Hash power data has been deleted.')
            }
        })
    }
})