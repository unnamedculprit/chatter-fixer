var num_posts = 0;
var num_comments = 0;
var fixer_running = 0;

// do the thing
fixVisiblePosts();

// now we've done the thing, check how tall the content is
original_height = documentHeight();

// catch when the infinite scroll page loading happens.
// when we scroll past the original height, it must have loaded more, so run the fixer again.
window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= original_height) {
        // you're at the bottom of the page
        console.log("You've scrolled past the bottom!");
        if(!fixer_running)
        	fixVisiblePosts();
        else
        	console.log("fixer already running so not running again");
    }
};


//
// Functions
//


// main function
function fixVisiblePosts()
{
	fixer_running = 1;
	console.log("CHATTER ATTACHMENT FIXER RUNNING");

	// search the webpage, by class name, to find post attachments and entire comments
	post_attachments = document.getElementsByClassName("feeditemattachments");
	comments = document.getElementsByClassName("feeditemcommentbody");

	// search each comment by class name to find comment attachments
	var comment_attachments = [];
	Array.from(comments).forEach(function(a)
	{
		att = a.getElementsByClassName("contentPost")
		if( att.length >0 )
		{
			comment_attachments.push(att[0]);
		}
	});

	//go through all posts, fix them, and count them, so we can start from the nth next time we do this
	num_posts = fixPostArray(Array.from(post_attachments), num_posts);
	num_comments = fixPostArray(comment_attachments, num_comments);
	
	original_height = documentHeight();
	fixer_running = 0;
}

// returns an array of url paramaters. pass it a string
// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getUrlParameters (urlstring) 
{
	a = urlstring.split("&");
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}

//ads an extra row to the attachment table, and puts the html in it.
function extraTableRow(attachment, html)
{
	a = attachment;
	if(table = a.getElementsByClassName("contentPost")[0])
	{
		//woohoo
	}
	else
	{
		table = a;
	}
	
	var row = table.insertRow(-1);
	var cell1 = row.insertCell(0);
	cell1.setAttribute("colspan","2")
	cell1.innerHTML = html;

}


function documentHeight()
{
	var body = document.body,
    html = document.documentElement;
	var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
	
	return height;
}

//goes through an array of post attachments or comments, works out its details and adds attachment previews.
//returns total number of posts.
function fixPostArray(attachments, num_attachments)
{
	var post_counter = 0;
	attachments.forEach(function(a, i)
	{
		if(post_counter >= num_attachments)
		{
			//increment counter so we can skip this post on infinite scroll.
			num_attachments++;
			// find the page elements containing the link and title
			title_element = a.getElementsByClassName("contentTitleLink")[0];
			link_element = a.getElementsByClassName("contentActionLink")[1];
		
			if(title_element && link_element)
			{
				// get the correct strings
				title = title_element.textContent;
				link = link_element.href;
				
				console.log("Fixing:", post_counter, num_attachments, title);

				// see if there's a thumbnail. otherwise give up
				if(thumb_element = a.getElementsByClassName("contentThumbnail")[0])
				{
					var thumb = [];
			
					if(thumb_element.nodeName === "IMG")
						thumb.url = thumb_element.src;

					// steal some attachment info from the thumbnail
					// attachments seem to be referred to by contentId and versionId
					p = getUrlParameters(thumb.url);
					thumb.cid = p["contentId"];
					thumb.vid = p["versionId"];
							
					if(thumb && thumb.url.includes("doctype_video"))
					{
						//it's a video. create a player
						//console.log("VIDEO: ", title, link);
						extraTableRow(a, "<video width='100%' preload='metadata' controls><source src='"+link+"'></video>");
					}
					else if(thumb && thumb.url.includes("doctype_audio"))
					{
						//it's audio. create a player
						//console.log("AUDIO: ", title, link);
						extraTableRow(a, "<audio width='100%' preload='metadata' controls><source src='"+link+"'></audio>");

					}
					else if(thumb && thumb.url.includes("renditionDownload"))
					{
						//assume its an image
						thumb.imageurl = "https://thisisglobal--c.eu7.content.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId="+ thumb.vid +"&operationContext=CHATTER&contentId="+ thumb.cid;
						//console.log("PREVIEWABLE ITEM: ", title, thumb, link);
						html = "<a href='"+thumb.imageurl+"'>";
						html += "<img src='"+thumb.imageurl+"' alt='"+ title +"' width='100%'>";
						html += "</a>";
						extraTableRow(a, html);
					}
					else
						console.log("Unknown ITEM: ", title.textContent, link.href);				
				}
				else
				{
					console.log("No thumbnail found for attachment, so not creating preview.");
				}
			
			}
			else
			{
				//console.log("Couldn't find title or link for attachment, so giving up.", a);
			}
			

		}	
		else
		{
			if(title_element = a.getElementsByClassName("contentTitleLink")[0])
				console.log("We've already done this post.", post_counter, num_attachments, title_element.textContent);
			else
				console.log("We've already done this post.", post_counter, num_attachments);
		}
		
		post_counter++;
	});
	
	return num_attachments;
}
