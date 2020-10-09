exports.getDate = function(){
    const date = new Date();
    let options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    
    return date.toLocaleDateString("en-us", options) //en is language option, you may specify..
}
