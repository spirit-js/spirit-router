local reported = 0

function response(status, headers, body)
  if status ~= 200 or body ~= "Hello World" then
    if reported == 0 then
      print("test failed")
      reported = 1
    end
    wrk.thread:stop()
  end
end