async function GetData(url){
    try {
        let response = await fetch(url);
        if(response.ok){
        let data = await response.json();
            return data;
        }else{
            throw new Error("Something went wrong");
        }
    } catch (error) {
        console.log(error);;
    }
}

export default GetData