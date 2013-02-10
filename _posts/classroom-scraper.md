{{{
  "title" : "Prototyping a classroom schedule scraper",
  "tags"  : ["flask", "python", "beautifulsoup", "sqlite", "webapp"],
  "category" : "python",
  "date" : "2/1/2013",
  "syntax" : "python"
}}}

#### The problem and goal
- Knowledge of which classrooms are vacant and for how long
- easy and portable way of accessing the information that's given
- a simple UI for searching this data
- a reason to develop a web app :)

The university has a [site](http://wvprd.ocm.umn.edu/gpcwv/wv3_servlet/urd/run/wv_space.DayList?spdt=20130203,spfilter=945403,lbdviewmode=grid) for this, but it's... how to put this lightly.. bad. 
I believe this idea was mentioned a year or so ago, but sometimes you just have to make the repo and they will come. (There's a Field of Dreams joke in there somewhere)

<!--more-->

#### The Solution
I started a github public repo and dropped in some [BeautifulSoup](http://www.crummy.com/software/BeautifulSoup/) and a python virtualenv and told some people about it.  I had the idea that this project would take a day or so, but the expectations quickly grew. 
Initially it was supposed to just collect the data and spit it back for anyone who pinged a server holding the scraper code, but for fun we dropped the scrapes into a sqlite db. 
Since the data is collected daily, there was no reason to use anything more "serious".

#### The Scraper
After about 2 hours of mucking about with scraping we had all the data we needed for a prototype so we took the time to refactor what we had and organize it for placing in a database. 
I threw together a Flask application and used the boilerplate database query methods to grab data from our database. With a tiny bit of css and jinja templating, we had a crappy looking webapp which did part of its job.  

![initial design](/imgs/_posts/scraper-page-prelim.png)


#### The 2nd round
After 2 days of work we had a completely workable webapp running on a spare VPS, but there were a few conveniences to add.

- a new scraper for classroom data
- classrooms table holding classroom specific information (in the initial design we had the basic room title stored along with the gaps)
- less awful looking interface with at least some user interaction
- a few methods here and there to manipulate time data into the correct formats

It would be more telling to show a screenshot from a phone using this, but alas, I didn't take one.
For me, this was the most useful aspect of it, so if it didn't work smoothly on a phone, there wasn't much point.
This is what we came up with the second round of coding:  

![2nd redux](/imgs/_posts/scraper-page-2nd.png)  

At this point we could search for specific buildings, the time data was more user friendly, it didn't look terrible, it scaled down to smart phone scale well, AND the backend was much more organized. 
There are some ui changes to make with jquery and the class info dropdowns, but essentially we created and deployed a useful webapp in a matter of 3-4 days.  

Check it out and make use of it during those long days on campus  
[brontasaur.us](http://brontasaur.us)
