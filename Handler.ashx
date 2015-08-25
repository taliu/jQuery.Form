<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Linq;
public class Handler : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        if (context.Request["type"] == "get")//获取用户 handler?type=get&index=1
        {
            var u = BLL.User.Users.FirstOrDefault(o => o.id == context.Request["index"]);
            if (u != null)
            {
                context.Response.Write(new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(u));
            }
        }
        else if (context.Request["type"] == "add")
        {
            var user = new BLL.User();
            int i;
            if (int.TryParse(context.Request["id"], out   i))
            {
                if (i > 0)//修改
                {
                    user = BLL.User.Users.FirstOrDefault(o => o.id == i.ToString());
                }
            }

            typeof(BLL.User).GetProperties().ToList().ForEach(o =>
            {
                var val = context.Request[o.Name];
                if (val != null)
                {
                    o.SetValue(user, val, null);
                }
            });
            if (i <= 0)
            {
                if (BLL.User.Users.Count > 0)
                {
                    user.id = (int.Parse(BLL.User.Users.Max(o => o.id)) + 1).ToString();
                }
                else
                {
                    user.id = "1";
                }
                BLL.User.Add(user);
            }

            context.Response.Write("成功");
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}