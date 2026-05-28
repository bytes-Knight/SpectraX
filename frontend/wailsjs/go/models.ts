export namespace scanner {
	
	export class ScanResult {
	    url: string;
	    parameter: string;
	    found_in: string;
	    char_analysis: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new ScanResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.url = source["url"];
	        this.parameter = source["parameter"];
	        this.found_in = source["found_in"];
	        this.char_analysis = source["char_analysis"];
	    }
	}

}

