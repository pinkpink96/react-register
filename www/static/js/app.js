(function() {

    let module_ = this;
    this.default_img = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Balloon_over_Luxor_-_Egypt_denoised.jpg/1920px-Balloon_over_Luxor_-_Egypt_denoised.jpg";
    this.api_proto = "https";
    this.api_host = "172.18.191.147";
    // port should be specified explicitly: e.g. 80 or 443
    this.api_port = "443";
    this.endpoint_registratoin = "/registration/";

    /*
        / = www.oss.com
        /registration/ = www.oss.com/registration/


        / = www.oss.com
        https://ip-addr:port/registration
    */

    this.get_api_baseurl = function(is_same_origin) {
        if (!is_same_origin) {
            return this.api_proto + "://" + this.api_host + ':' + this.api_port;
        }
        return "";
    }

    this.get_full_api_url = function(endpoint_attr_name, is_same_origin) {
        return this.get_api_baseurl(is_same_origin) + this[endpoint_attr_name];
    }

    class RegistrationForm {

        constructor() {
            this._allocate_panels();

            $("#btn_register").on("click", this.register.bind(this));
            $("#btn_logout").on("click", this.logout.bind(this));
        }

        _allocate_panels() {

            let found = $("div").filter(function() {
                return this.id.match(/panel_+/);
            });
            let each;
            for (each of found) {
                this[each.id] = $(each);
            }
        }

        register() {
            let that = this;
            this.panel_loading.addClass("d-none");
            let btn_register = $("#btn_register");
            btn_register.attr("disabled", true);

            let data = way.get("twofadata");
            // console.info(data); // debugging // {"username": "", "password": ""}
            let api_url = module_.get_full_api_url("endpoint_registratoin", true);
            let options = {
                crossDomain: true,
                method: 'POST',
                url: api_url,
                data: JSON.stringify(data),
                beforeSend: function (xhr) {
                    xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
            }

            let ajax_req = $.ajax(options);
            ajax_req.done(function(d, status, xhr) {
                let binary = "";
                let responseText = xhr.responseText;
                let responseTextLen = responseText.length;

                for (var i = 0; i < responseTextLen; i++) {
                    binary += String.fromCharCode(responseText.charCodeAt(i) & 255);
                }
                that.panel_registration.addClass("d-none");
                that.panel_welcome.removeClass("d-none");
                that.panel_qrcode.removeClass("d-none");
                $("#img_qrcode").prop("src", "data:image/png;base64," + btoa(binary));
            });

            ajax_req.fail(function(d, status, xhr) {
                console.warn(d);
            });

            ajax_req.always(function(d, status, xhr) {
                that.panel_loading.addClass("d-none");
                btn_register.attr("disabled", false);
            });
        }

        logout() {
            $("#img_qrcode").prop("src", this.default_img);
            this.panel_registration.removeClass("d-none");
            this.panel_welcome.addClass("d-none");
            this.panel_qrcode.addClass("d-none");
            way.set("twofadata", {});
        }

    }

    let init = function() {

        let frm_reg = new RegistrationForm();

        console.info("INIT Done.");
    }

    $(function() {
        console.info("DOM Ready!");
        init();
    });

})();