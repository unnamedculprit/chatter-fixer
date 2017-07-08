console.log("CHATTER ATTACHMENT FIXER RUNNING");

attachments = document.getElementsByClassName("feeditemattachments");

Array.from(attachments).forEach(function(a, i)
{
	title_element = a.getElementsByClassName("contentTitleLink")[0];
	link_element = a.getElementsByClassName("contentActionLink")[1];
	if(title_element && link_element)
	{
		title = title_element.textContent;
		link = link_element.href;
		
		// see if there's a thumbnail. otherwise give up
		if(thumb_element = a.getElementsByClassName("contentThumbnail")[0])
		{
			// steal some attachment info from the thumbnail
			var thumb = [];
			
			if(thumb_element.nodeName === "IMG")
				thumb.url = thumb_element.src;
			
			p = getUrlParameters(thumb.url);
			thumb.cid = p["contentId"];
			thumb.vid = p["versionId"];
			thumb.imageurl = "https://thisisglobal--c.eu7.content.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId="+ thumb.vid +"&operationContext=CHATTER&contentId="+ thumb.cid;
						
			if(thumb && thumb.url.includes("doctype_video"))
			{
				//it's a video
				console.log("VIDEO: ", title, link);
				extraTableRow(a, "<video width='100%' preload='metadata' controls><source src='"+link+"'></video>");
			}
			else if(thumb && thumb.url.includes("doctype_audio"))
			{
				//it's AUDIO
				console.log("AUDIO: ", title, link);
				extraTableRow(a, "<audio controls><source src='"+link+"'></audio>");

			}
			else if(a.getElementsByClassName("previewHover"))
			{
				//assume its an image
				//console.log("PREVIEWABLE ITEM: ", thumb, title, link);
				html = "<a href='"+thumb.imageurl+"'>";
				html += "<img src='"+thumb.imageurl+"' alt='"+ title +"' width='100%'>";
				html += "</a>";
				extraTableRow(a, html);
			}
			else
				console.log("ITEM: ", title.textContent, link.href);
		}
	}
	
});


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


function extraTableRow(attachment, html)
{
	a = attachment;
	if(table = a.getElementsByClassName("contentPost")[0])
	{
		var row = table.insertRow(-1);
		var cell1 = row.insertCell(0);
		cell1.setAttribute("colspan","2")
		cell1.innerHTML = html;
	}
}
